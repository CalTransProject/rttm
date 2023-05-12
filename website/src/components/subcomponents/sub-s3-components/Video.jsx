import ReactHlsPlayer from 'react-hls-player';
import {memo, useRef} from "react";

const Video = memo(({sid}) => {
  const playerRef = useRef()
  const manifest = Number(sid) ? `https://arcscsun.s3.us-east-1.amazonaws.com/stream/${sid}/${sid}.m3u8` : 'https://'

  return (
    <ReactHlsPlayer
      playerRef={playerRef}
      src={manifest}
      autoPlay={true}
      controls={true}
      width="100%"
      height="100%"
      hlsConfig={{
        debug: false,
        maxBufferLength: 30,
        enableWorker: true
      }}
      muted
    />
  )
})

export default Video
