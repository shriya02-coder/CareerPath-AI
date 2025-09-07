#===================================================
# Testing Protocol (READ-ONLY FOR TESTING AGENTS)
#===================================================
[... existing content preserved ...]

## frontend:
##   - task: "ResumeAssistant: add inline per-bullet Rewrite with Apply; stronger pointers"
##     implemented: true
##     working: "NA"
##     file: "/app/frontend/src/components/ResumeAssistant.jsx"
##     stuck_count: 0
##     priority: "critical"
##     needs_retesting: true
##     status_history:
##         -working: false
##         -agent: "main"
##         -comment: "Added inline rewrite using /api/resume/rewrite-bullet. Shows improved, rationale, keywords; Apply replaces the specific bullet in textarea."