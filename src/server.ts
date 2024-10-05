import express, { Request, Response, type Express } from 'express';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { createServer, type Server } from 'http';

const app: Express = express();
const port: number = 3000;

app.get('/stream', async (req: Request, res: Response) => {
    const url: string = req.query.url as string;
    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info: ytdl.videoInfo = await ytdl.getInfo(url);
        res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        const stream = ytdl(url, { quality: 'highestaudio' });
        ffmpeg(stream)
            .audioBitrate(128)
            .format('mp3')
            .on('error', err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            })
            .pipe(res, { end: true });

    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to process the request');
    }
});

const server: Server = createServer(app);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
