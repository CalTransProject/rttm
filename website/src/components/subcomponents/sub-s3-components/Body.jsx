import Graph from "./Graph";
import {useEffect, useState} from "react";
import {fetchDataset, fetchStreamInfo} from "./api"
import {Container, Skeleton} from "@mui/material";
import Video from "./Video";
import "./videoPlayer.css";

const getEntries = (dataset) => {
  return (
    Object.entries(dataset?.Items?.reduce((acc, item) => {
      item?.Category?.split(',').map(c => c.trim()).forEach(c => c in acc ? acc[c] += 1 : acc[c] = 1)
      return acc
    }, {}) || {}).filter(([k, _v]) => !['StreamId', 'Time', 'Category'].includes(k))
  )}

const toGraphData = (dataset) => {
  const obj = Object.fromEntries(getEntries(dataset))
  return ({
    labels: Object.keys(obj), datasets: [{
      label: "label",
      data: Object.values(obj),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }]
  })
}

const Body = () => {
  const [streamId, setStreamId] = useState('0')
  const [dataset, setDataset] = useState({})
  const [graphData, setGraphData] = useState(toGraphData(dataset))

  const updateData = (sid) => fetchDataset(sid).then(dataset => {
    setDataset(dataset)
    setGraphData(toGraphData(dataset))
  })

  const update = () => fetchStreamInfo().then(res => {
    const sid = 'sid' in res ? res.sid : '0'
    if (sid !== streamId) setStreamId(sid)
    return Number(sid) ? updateData(sid) : setGraphData(toGraphData({}))
  })

  useEffect( () => {
    (async () => await update())()
    setInterval(async () => await update(), 10 * 1000)
  }, [])

  return (
      <div className="video-box">
        {Number(streamId) ? <Video sid={streamId}/> : <Skeleton variant="rectangular" maxWidth={false} height={413}/>}
        
        {/* Graph that correlates with the video above */}
        {/* <Graph sid={streamId} data={graphData}/> */}
      </div>
  )
}

export default Body;
