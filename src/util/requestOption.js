export default function requestOption(token) {
  if (token != null || token != "") {
    const requestOptions = {
    //   method: "POST",
      headers: {
        // Accept: "application/json",
        // "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        // mode: "no-cors",
        // "Access-Control-Allow-Origin": "http://18.136.195.171:8080",
        // "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        // "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
    };
    return requestOptions;
  }
}

