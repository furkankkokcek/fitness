async function fetchWithRetry(url, retries=3, delayMs=800){
  for(let i=0;i<retries;i++){
    try{
      const resp=await fetch(url);
      if(resp.status===503){
        if(i<retries-1){ await new Promise(r=>setTimeout(r,delayMs*(i+1))); continue; }
        throw new Error('503');
      }
      return resp;
    }catch(e){
      if(i===retries-1) throw e;
      await new Promise(r=>setTimeout(r,delayMs*(i+1)));
    }
  }
}
