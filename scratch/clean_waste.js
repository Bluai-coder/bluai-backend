const fs = require('fs');
const file = 'c:/Users/NitinSaini/Documents/GitHub/limsv1-backend/src/controllers/waste.controller.js';
let content = fs.readFileSync(file, 'utf8');

// Match `const tenantSubdomain...` down to `tenant.schemaName;`
// We carefully capture `let t;` or `console.log` or `try {` that might be in between.

const blockRegex = /const\s+tenantSubdomain\s*=\s*req\.headers\[['"]x-tenant['"]\];(.*?)const\s+tenant\s*=\s*await\s+db\.Tenant\.findOne\(\{\s*where:\s*\{\s*subdomain:\s*tenantSubdomain\s*\},?\s*\}\);\s*if\s*\(!tenant\)\s*\{\s*(?:console\.error\([^)]*\);\s*)?return\s+res\.status\(404\)\.json\(\{[\s\S]*?\}\);\s*\}(.*?)const\s+schema\s*=\s*tenant\.schemaName;/gs;
  
content = content.replace(blockRegex, `$1$2\n    const schema = req.schema;\n    const tenantId = req.tenant?.id;\n    if (!schema) return res.status(400).json({ success: false, message: "Tenant schema not resolved" });`);

// Clean up redundant tenantId declarations
content = content.replace(/const schema = req\.schema;\n\s*const tenantId = req\.tenant\?\.id;\n\s*if \(!schema\) return res\.status\(400\)\.json\(\{ success: false, message: "Tenant schema not resolved" \}\);\s*const tenantId = tenant\.id;/gs, 
`const schema = req.schema;\n    const tenantId = req.tenant?.id;\n    if (!schema) return res.status(400).json({ success: false, message: "Tenant schema not resolved" });`);

content = content.replace(/tenant\.id/g, 'tenantId');
content = content.replace(/tenant\.name/g, 'req.tenant?.name');

fs.writeFileSync(file, content, 'utf8');
console.log("Refactored waste.controller.js safely");
