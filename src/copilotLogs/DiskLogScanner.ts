/**
 * WISH-01: Copilot Log Exporter MCP
 * Disk Log Scanner - Reads and parses GitHub Copilot Chat logs from disk
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CopilotRequestIndex } from './types';

/**
 * Scans VS Code log files for Copilot Chat request metadata
 */
export class DiskLogScanner {
	private logBasePath: string;
	private cachedRequests: Map<string, CopilotRequestIndex> = new Map();
	private lastScanTime: Date | null = null;

	constructor() {
		// Platform-specific log paths
		switch (process.platform) {
			case 'darwin':
				this.logBasePath = path.join(
					os.homedir(),
					'Library/Application Support/Code/logs'
				);
				break;
			case 'win32':
				this.logBasePath = path.join(
					process.env.APPDATA || '',
					'Code/logs'
				);
				break;
			default: // linux
				this.logBasePath = path.join(
					os.homedir(),
					'.config/Code/logs'
				);
		}
	}

	/**
	 * Find the most recent Copilot Chat log file
	 */
	async findLatestLogFile(): Promise<string | null> {
		try {
			if (!fs.existsSync(this.logBasePath)) {
				console.warn(`Log base path does not exist: ${this.logBasePath}`);
				return null;
			}

			// Get all timestamp directories
			const entries = fs.readdirSync(this.logBasePath, { withFileTypes: true });
			const timestampDirs = entries
				.filter((e: fs.Dirent) => e.isDirectory() && /^\d{8}T\d{6}$/.test(e.name))
				.map((e: fs.Dirent) => e.name)
				.sort()
				.reverse();

			// Search for Copilot Chat log in each timestamp dir (most recent first)
			for (const timestampDir of timestampDirs) {
				const copilotLogPath = path.join(
					this.logBasePath,
					timestampDir,
					'window1/exthost/GitHub.copilot-chat/GitHub Copilot Chat.log'
				);

				if (fs.existsSync(copilotLogPath)) {
					return copilotLogPath;
				}

				// Also check window2, window3, etc.
				for (let i = 2; i <= 5; i++) {
					const altPath = path.join(
						this.logBasePath,
						timestampDir,
						`window${i}/exthost/GitHub.copilot-chat/GitHub Copilot Chat.log`
					);
					if (fs.existsSync(altPath)) {
						return altPath;
					}
				}
			}

			return null;
		} catch (error) {
			console.error('Error finding latest log file:', error);
			return null;
		}
	}

	/**
	 * Scan log file and extract request metadata
	 */
	async scanLogFile(logPath?: string): Promise<CopilotRequestIndex[]> {
		const targetPath = logPath || await this.findLatestLogFile();

		if (!targetPath) {
			console.warn('No Copilot Chat log file found');
			return [];
		}

		try {
			const content = fs.readFileSync(targetPath, 'utf-8');
			const lines = content.split('\n');
			const requests: CopilotRequestIndex[] = [];

			// Regex patterns for parsing log entries
			// Format: "2025-12-30 18:29:29.013 [info] ..."
			const timestampPattern = /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+\[/;
			// ccreq pattern: "ccreq:17f648d1.copilotmd"
			const ccreqPattern = /ccreq:([a-f0-9]{8})\.copilotmd/i;
			const requestIdPattern = /request\s+([a-f0-9]{8})/i;
			const modelPattern = /model[:\s]+([a-zA-Z0-9\-\.]+)/i;
			const durationPattern = /(\d+)ms/;
			const tokensPattern = /(\d+)\s*(?:prompt\s*)?tokens/i;
			const cachedPattern = /(\d+)\s*cached/i;

			let currentEntry: Partial<CopilotRequestIndex> = {};

			for (const line of lines) {
				// Extract timestamp
				const timestampMatch = line.match(timestampPattern);
				if (timestampMatch) {
					// If we have a complete previous entry, save it
					if (currentEntry.id && currentEntry.timestamp) {
						requests.push(currentEntry as CopilotRequestIndex);
						this.cachedRequests.set(currentEntry.id, currentEntry as CopilotRequestIndex);
					}
					currentEntry = {
						timestamp: new Date(timestampMatch[1])
					};
				}

				// Extract request ID from ccreq: pattern (most reliable)
				const ccreqMatch = line.match(ccreqPattern);
				if (ccreqMatch) {
					currentEntry.id = ccreqMatch[1];
				}

				// Fallback: Extract request ID from "request XXXXXXXX" pattern
				if (!currentEntry.id) {
					const requestIdMatch = line.match(requestIdPattern);
					if (requestIdMatch) {
						currentEntry.id = requestIdMatch[1];
					}
				}

				// Extract model
				const modelMatch = line.match(modelPattern);
				if (modelMatch) {
					currentEntry.model = modelMatch[1];
				}

				// Extract duration
				const durationMatch = line.match(durationPattern);
				if (durationMatch) {
					currentEntry.durationMs = parseInt(durationMatch[1], 10);
				}

				// Extract tokens
				const tokensMatch = line.match(tokensPattern);
				if (tokensMatch) {
					currentEntry.promptTokens = parseInt(tokensMatch[1], 10);
				}

				// Extract cached tokens
				const cachedMatch = line.match(cachedPattern);
				if (cachedMatch) {
					currentEntry.cachedTokens = parseInt(cachedMatch[1], 10);
				}
			}

			// Don't forget the last entry
			if (currentEntry.id && currentEntry.timestamp) {
				requests.push(currentEntry as CopilotRequestIndex);
				this.cachedRequests.set(currentEntry.id, currentEntry as CopilotRequestIndex);
			}

			this.lastScanTime = new Date();
			return requests;

		} catch (error) {
			console.error('Error scanning log file:', error);
			return [];
		}
	}

	/**
	 * Get all known request IDs
	 */
	getKnownRequestIds(): string[] {
		return Array.from(this.cachedRequests.keys());
	}

	/**
	 * Get request metadata by ID
	 */
	getRequestMetadata(id: string): CopilotRequestIndex | undefined {
		return this.cachedRequests.get(id);
	}

	/**
	 * Get requests within a time range
	 */
	getRequestsInRange(start: Date, end: Date): CopilotRequestIndex[] {
		return Array.from(this.cachedRequests.values())
			.filter(r => r.timestamp >= start && r.timestamp <= end)
			.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	}

	/**
	 * Get the log base path (for debugging)
	 */
	getLogBasePath(): string {
		return this.logBasePath;
	}

	/**
	 * Get last scan time
	 */
	getLastScanTime(): Date | null {
		return this.lastScanTime;
	}
}
