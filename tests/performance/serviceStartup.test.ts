/**
 * Performance tests for critical extension operations
 */

import { measurePerformance } from '../setup';

// =============================================================================
// WP-V90 · POR QUÉ ESTE FICHERO YA NO ASEVERA SOBRE EL RELOJ DE PARED
//
// Las cuatro cotas de duración que vivían aquí (:17 <100 ms, :54 <500 ms,
// :85 <50 ms, :107 <100 ms) y la de montón (:37 <5 MB) cronometraban trabajo
// SINTÉTICO —un `setTimeout`, un bucle de 50 arrays, un filter/map de 10.000—
// que no toca una sola línea de producto. Lo que medían era la carga de la
// máquina en ese instante. Sobre una suite cuyo estado se compara por
// CONJUNTO DE ROJOS, eso no es una molestia: es lo que hace que un rojo REAL
// se pueda despachar como «flapeo».
//
// Se BORRAN, no se les sube el techo. Cada test conserva la aserción funcional
// que sí podía demostrar.
//
// Y no valía taparlas con un reloj falso. MEDIDO en este árbol: los timers
// falsos modernos de jest 29.7.0 REEMPLAZAN `process.hrtime.bigint` —que es
// justo el reloj que usa `measurePerformance` (tests/setup.ts:112-114)—, así
// que `duration` pasaría a valer exactamente lo que el propio test avanzara.
// La aserción sobreviviría como tautología sobre su propio guion: verde
// perpetuo que no mide nada, que es peor que un rojo.
//
// Un presupuesto de rendimiento de verdad es un banco que se REPORTA y se
// compara contra sí mismo a lo largo del tiempo, no una aserción binaria
// dentro del gate. Ver la propuesta en plan/REPORTES/WP-V90-jest-determinista.md.
// =============================================================================

describe('Performance Tests', () => {
    describe('Service Initialization', () => {
        it('should initialize services within time threshold', async () => {
            // WP-V90 (censo #3): borrada `expect(duration).toBeLessThan(100)`.
            const { result } = await measurePerformance(async () => {
                // Simulate service initialization
                await new Promise(resolve => setTimeout(resolve, 10));
                return { initialized: true };
            });

            expect(result.initialized).toBe(true);
        });
    });

    describe('Memory Usage', () => {
        it('should not cause significant memory leaks', async () => {
            // WP-V90 (censo #11): borrada
            // `expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024)`.
            // `heapUsed` depende de cuándo entre el GC de V8, no del código.
            const operations = Array.from({ length: 100 }, async (_, i) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                return { operation: i };
            });

            const resultados = await Promise.all(operations);

            expect(resultados).toHaveLength(100);
            expect(resultados[99]).toEqual({ operation: 99 });
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent requests efficiently', async () => {
            // WP-V90 (censo #4): borrada `expect(duration).toBeLessThan(500)`.
            // Y la espera deja de ser `Math.random() * 10`: una entrada
            // aleatoria en un test es no-determinismo aunque hoy no llegue a
            // teñir ninguna aserción.
            const concurrentCount = 10;
            const { result } = await measurePerformance(async () => {
                const promises = Array.from({ length: concurrentCount }, async (_, i) => {
                    await new Promise(resolve => setTimeout(resolve, i % 5));
                    return { id: i, completed: true };
                });

                return await Promise.all(promises);
            });

            expect(result).toHaveLength(concurrentCount);
            result.forEach((item: any) => {
                expect(item.completed).toBe(true);
            });
        });
    });

    describe('Resource Cleanup', () => {
        it('should cleanup resources efficiently', async () => {
            // WP-V90 (censo #5): borrada `expect(duration).toBeLessThan(50)`.
            // Cronometraba un bucle de 50 arrays: puro reloj de máquina.
            const resources: any[] = [];
            const dispuestos: number[] = [];

            await measurePerformance(async () => {
                // Create resources
                for (let i = 0; i < 50; i++) {
                    resources.push({
                        id: i,
                        data: new Array(1000).fill(i),
                        dispose: jest.fn(() => dispuestos.push(i))
                    });
                }

                // Cleanup resources
                resources.forEach(resource => {
                    resource.dispose();
                    resource.data = null;
                });

                resources.length = 0;
                return true;
            });

            // Lo verificable: se liberaron los 50, en orden, y la lista quedó vacía.
            expect(dispuestos).toHaveLength(50);
            expect(dispuestos[0]).toBe(0);
            expect(dispuestos[49]).toBe(49);
            expect(resources).toHaveLength(0);
        });
    });

    describe('Data Processing', () => {
        it('should process large datasets efficiently', async () => {
            // WP-V90 (censo #6): borrada `expect(duration).toBeLessThan(100)`.
            // Cronometraba un filter/map de 10.000 elementos.
            // Además, el juego de datos deja de nacer de `Math.random()`: con
            // valores aleatorios, CUÁNTOS elementos pasan el filtro cambiaba en
            // cada corrida, y la única aserción de contenido
            // (`result.forEach(...)`) no aseveraba NADA si el filtro se
            // quedaba vacío. Con una rampa determinista, el cardinal es
            // conocido y se puede aseverar de verdad.
            const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                value: i / 10000, // rampa determinista: 5.000 quedan por encima de 0,5
                timestamp: 0
            }));

            const { result } = await measurePerformance(async () => {
                // Process data
                return largeDataset
                    .filter(item => item.value > 0.5)
                    .map(item => ({ ...item, processed: true }))
                    .slice(0, 100); // Take first 100 processed items
            });

            expect(result).toHaveLength(100);
            expect(result[0].id).toBe(5001);
            result.forEach((item: any) => {
                expect(item.processed).toBe(true);
            });
        });
    });
});
