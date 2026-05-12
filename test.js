const { exec } = require('child_process');

exec('curl -s http://localhost:8002/index.html | head -n 30', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
