const mockSpeedData = (initialData) => {
    const num = Math.floor(Math.random() * 10)
    const lastItem = initialData.at(-1)
    const newTime = lastItem.time +1 
    const item = { time: newTime, speed: lastItem.speed }
    if (num < 6) {
      const num1 = Math.floor(Math.random() * 10)
      if (num1 % 2 === 0) {
        item.speed += 1
      }else if (item.speed > 0 ){
        item.speed -= 1
      }
    }

    const newSpeedData = [...initialData, item]
    console.log(newSpeedData)
    return newSpeedData
  };
  export default mockSpeedData; 