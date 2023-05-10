export const fetchStreamInfo = async () => {
  const arccsunMetaApi = 'https://2fc91z5147.execute-api.us-east-1.amazonaws.com/arcscsun/app'
  return await fetch(arccsunMetaApi).then(async (res) => res.status === 200 ? await res.json() : {})
}

export const fetchDataset = async (sid) => {
  const arccsunApi = `https://kyld5svbf5.execute-api.us-east-1.amazonaws.com/arcscsun/app?sid=${sid}`
  return await fetch(arccsunApi).then(async (res) => res.status === 200 ? await res.json() : {})
}