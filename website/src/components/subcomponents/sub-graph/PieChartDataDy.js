const mockPercentageData = (initialData) => {
    const newData = initialData.map((item) => {
      return {
        name: item.name,
        value: Math.floor(Math.random() * 100) + 1
      };
    });
    return newData;
  };
  export default mockPercentageData;