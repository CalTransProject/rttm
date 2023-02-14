export const fetchStreamInfo = async () => {
  const arccsunMetaApi = 'https://sxroo9peu5.execute-api.us-east-1.amazonaws.com/arcscsun/app'
  return await fetch(arccsunMetaApi).then(async (res) => res.status === 200 ? await res.json() : {})
}

export const fetchDataset = async (sid) => {
  const arccsunApi = `https://82ibut9nt5.execute-api.us-east-1.amazonaws.com/arcscsun/app?sid=${sid}`
  return await fetch(arccsunApi).then(async (res) => res.status === 200 ? await res.json() : {})
}
