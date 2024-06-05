const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

function cleanupUploadsFolder() {
  const projectsFolderPath = path.join(__dirname, 'uploads', 'Projects');
  const eventsFolderPath = path.join(__dirname, 'uploads', 'events');
  const newsFolderPath = path.join(__dirname, 'uploads', 'news');
  const usersFolderPath = path.join(__dirname, 'uploads', 'users');
  const researchFolderPath = path.join(__dirname, 'uploads', 'research');

  const subfolders = [
    projectsFolderPath,
    eventsFolderPath,
    newsFolderPath,
    usersFolderPath,
    researchFolderPath,
  ];
  const maxAgeInMs = 60 * 1000;

  subfolders.forEach((subfolder) => {
    fs.readdir(subfolder, (err, files) => {
      if (err) {
        console.error('Error reading subfolder:', subfolder, err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(subfolder, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error('Error getting stats for file:', filePath, err);
            return;
          }

          const currentTime = new Date().getTime();
          const fileLastModifiedTime = new Date(stats.mtime).getTime();
          const ageInMs = currentTime - fileLastModifiedTime;

          if (stats.isFile() && ageInMs > maxAgeInMs) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting file:', filePath, err);
              } else {
                console.log('Deleted file:', filePath);
              }
            });
          }
        });
      });
    });
  });
}

// Schedule the cleanup task to run every two minutes
const cleanup = () =>
  cron.schedule('*/10 * * * *', () => {
    console.log('Done, runs every 10 minutes');
    console.log('Running cleanup task...');
    cleanupUploadsFolder();
  });

module.exports = cleanup;
