import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { PassThrough } from "stream";

export function toOgg(buffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new Readable();
    inputStream.push(buffer);
    inputStream.push(null);

    const outputStream = new PassThrough();
    const chunks = [];

    ffmpeg(inputStream)
      .toFormat("ogg")
      .audioCodec("libopus")
      .audioChannels(1)
      .audioBitrate(128)
      .on("error", (err) => reject(err))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream);

    outputStream.on("data", (chunk) => chunks.push(chunk));
  });
}

export function renderVideo(imageBuffer, audioBuffer) {
  return new Promise((resolve, reject) => {
    const imageStream = new Readable();
    const audioStream = new Readable();
    const outputStream = new PassThrough();
    const chunks = [];

    imageStream.push(imageBuffer);
    imageStream.push(null); // Menandakan akhir stream
    audioStream.push(audioBuffer);
    audioStream.push(null);

    ffmpeg()
      .input(imageStream)
      .inputFormat("mjpeg") // Jika gambar dalam format JPG, gunakan 'mjpeg'
      .loop(1) // Menjaga gambar tetap tampil selama audio berlangsung
      .input(audioStream)
      .inputFormat("mp3") // Jika audio dalam format MP3, gunakan 'mp3'
      .outputOptions("-c:v libx264", "-tune stillimage")
      .outputOptions("-c:a aac", "-b:a 192k")
      .outputOptions("-shortest") // Durasi video mengikuti durasi audio
      .format("mp4")
      .on("error", (err) => reject(err))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream);

    outputStream.on("data", (chunk) => chunks.push(chunk));
  });
}

export default {
  toOgg,
};
