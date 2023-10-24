export const fetchStreamInfo = async () => {
  try {
    const arccsunMetaApi = 'https://2fc91z5147.execute-api.us-east-1.amazonaws.com/arcscsun/app';
    const response = await fetch(arccsunMetaApi);
    if (response.status === 200) {
      return await response.json();
    } else {
      console.error(`Failed with status: ${response.status}`);
      return {};
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
    return {};
  }
};

export const fetchDataset = async (sid) => {
  try {
    const arccsunApi = `https://kyld5svbf5.execute-api.us-east-1.amazonaws.com/arcscsun/app?sid=${sid}`;
    const response = await fetch(arccsunApi);
    if (response.status === 200) {
      return await response.json();
    } else {
      console.error(`Failed with status: ${response.status}`);
      return {};
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
    return {};
  }
};