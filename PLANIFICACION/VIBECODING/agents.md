# Agents Collaboration Guidelines

Base plan documents:

- `PLANIFICACION\VIBECODING\arrakis_theater_checkpoint_list.md` - Sprint main calendar
- `PLANIFICACION\VIBECODING\plan_arrakis_theater.md` - Master plan

- `PLANIFICACION\VIBECODING\estudio_elenco.md` - ChatParticipants plan
- `PLANIFICACION\VIBECODING\estudio_teatro` - Theater & Engine plan
- `PLANIFICACION\VIBECODING\arrakis_theater_main_context_base.md` - Technical overview


## Collaboration Protocols

See `arrakis_theater_main_checkpoint_list.md` for detailed progress tracking.

1.  **`arrakis_theater_main_context_base.md`** - Main agent context file
    -   Project overview and technical architecture
    -   Work dynamics and agent rules
    -   File permissions and quick start guide
2.  **`agents.md`** - Collaboration guidelines
    -   Technical specifications and code standards
    -   Agent specializations (Backend, Frontend, Config, Integration)
    -   Collaboration protocols and quality gates
3.  **`arrakis_theater_main_checkpoint_list.md`** - Trackable progress system
    -   50+ checkpoints across 8 phases
    -   Clear dependencies and current status
    -   Request-based progress tracking
4.  **`iteration_template.md`** - Standardized sprint structure
    -   Comprehensive template for consistent documentation
    -   Quality gates and handoff procedures
    -   READ ONLY template for copying to ITERATIONS/
6.  **`estudio_elenco.md`** - All relative to ChatParticipants (actors)
7.  **`estudio_teatro.md`** - All relative to Theater engine (production)

### Quick Start for Agents

1. **Check Status**: Read `arrakis_theater_main_checkpoint_list.md`
2. **Find Your Sprint**: Check `ITERATIONS/` for current work
3. **Follow Template**: Use `iteration_template.md` structure
4. **Update Progress**: Mark checkpoints as completed
5. **Document Work**: Add detailed notes to iteration file

### Handoff Process
1. **Status Update**: Mark checkpoints in `arrakis_theater_main_checkpoint_list.md`
2. **Documentation**: Complete iteration notes
3. **Testing**: Verify functionality before handoff
4. **Communication**: Clear summary of work completed

### Code Review Requirements
- **Functionality**: Feature works as specified
- **Standards**: Follows diogenes patterns
- **Clean Code**: No Spanish comments, no legacy patterns
- **Documentation**: Clear inline documentation

### Conflict Resolution
- **File Conflicts**: Last agent documents resolution approach
- **Technical Decisions**: Reference diogenes implementation
- **Architecture Changes**: Require user approval via checkpoint update


## Quality Gates

### Code Quality
- **No mixed languages** (JS only, no TS)
- **English comments only** (no Spanish)
- **Diogenes pattern compliance**
- **Clean, readable code**

### Functionality
- **100% asterion feature preservation**
- **Diogenes visual consistency**  
- **Configuration-driven behavior**
- **Proper error handling**

### Documentation  
- **Clear iteration notes**
- **Checkpoint status updates**
- **Technical decision rationale**
- **Handoff instructions**

## Common Pitfalls to Avoid

### Architecture Violations
- ❌ Mixing TypeScript and JavaScript
- ❌ Hardcoded configuration values
- ❌ Spanish comments or strings  
- ❌ Direct file system access (use config manager)

### Pattern Violations
- ❌ Non-diogenes template patterns
- ❌ Different navigation styles
- ❌ Inconsistent theme handling
- ❌ Breaking modular structure

### Process Violations
- ❌ Skipping checkpoint updates
- ❌ Incomplete iteration documentation  
- ❌ Working on unassigned tasks
- ❌ Making architectural changes without approval

## Emergency Procedures

### Rollback Protocol
1. Document the issue in current iteration
2. Revert to last known good checkpoint
3. Update checkpoint status to reflect rollback
4. Create new iteration for fix approach

### Escalation Path
1. **Technical Issues**: Reference diogenes implementation
2. **Architecture Questions**: User approval required  
3. **Scope Changes**: Update checkpoint list with user approval
4. **Blocking Dependencies**: Document in iteration, request guidance