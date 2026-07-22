const fs = require('fs');
const path = require('path');

const files = [
  'src/layouts/AuthLayout.jsx',
  'src/layouts/DashboardLayout.jsx',
  'src/layouts/AdminLayout.jsx',
  'src/pages/auth/LoginPage.jsx',
  'src/pages/auth/RegisterPage.jsx',
  'src/pages/dashboard/DashboardOverviewPage.jsx',
  'src/pages/accounts/ConnectedAccountsPage.jsx',
  'src/pages/posts/CreatePostPage.jsx',
  'src/pages/posts/PostsListPage.jsx',
  'src/pages/billing/SubscriptionPage.jsx',
  'src/pages/profile/ProfileSettingsPage.jsx',
  'src/pages/admin/AdminUsersPage.jsx',
  'src/pages/NotFoundPage.jsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const componentName = path.basename(file, '.jsx');
  let content = `import React from 'react';\n\nconst ${componentName} = () => {\n  return <div>${componentName}</div>;\n};\n\nexport default ${componentName};\n`;
  if (file.includes('Layout')) {
    content = `import React from 'react';\nimport { Outlet } from 'react-router-dom';\n\nconst ${componentName} = () => {\n  return (\n    <div className="${componentName}">\n      <Outlet />\n    </div>\n  );\n};\n\nexport default ${componentName};\n`;
  }
  fs.writeFileSync(fullPath, content);
});
console.log('Placeholders created successfully');
