const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  const upload = multer({ dest: 'uploads/' });
  app.use(cors());

  ffmpeg.setFfmpegPath(ffmpegPath);

  app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const outputPath = path.join(__dirname, 'uploads', `${req.file.filename}.mp4`);

    ffmpeg(filePath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .size('1280x720')
      .addOption('-preset', 'fast')
      .addOption('-tune', 'zerolatency')
      .addOption('-threads', '2')
      .on('end', () => {
        res.download(outputPath, 'converted.mp4', (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          fs.unlinkSync(filePath);
          fs.unlinkSync(outputPath);
        });
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err);
        res.status(500).send('Error during conversion');
        fs.unlinkSync(filePath);
      })
      .run();
  });

  app.listen(3001, () => {
    console.log(`Server worker ${process.pid} listening on port 3001`);
  });
}
