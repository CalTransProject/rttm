const mockPercentageData = (initialData) => {

    // const num = Math.floor(Math.random() * 10)
    // const catagories = ["suv", "car", "bus", "pickup", "truck" , "sedan"]
     const lastItem = initialData.at(-1)
    // const newTime = lastItem.time +1 
     const item = { data: [] , labels: ["Car" , "SUV", "Pickup", "Truck", "Bus" , "Sedan"]  }
    // if (num < 6) {
    //   const catagory = catagories[num];
    //   const num1 = Math.floor(Math.random() * 10)
    //   if (num1 % 2 === 0) {
    //     item[catagory] += 1
    //   }else if (item[catagory] > 0 ){
    //     item[catagory] -= 1
    //   }
    // }

    const newPercentageData = [...initialData, item]
    console.log(newPercentageData)
    return newPercentageData
  };
  export default mockPercentageData;