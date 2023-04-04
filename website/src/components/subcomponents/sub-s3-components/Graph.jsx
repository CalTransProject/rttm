import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,} from 'chart.js';
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Graph = ({sid, data}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: true,
        text: Number(sid) ? new Date(Number(sid) * 1000).toUTCString() : "No Current Video Stream",
      }
    }
  }

  return (
    <Bar options={options} data={data} />
  )
}

export default Graph;
