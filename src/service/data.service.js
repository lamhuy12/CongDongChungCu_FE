import requestOption from "@/util/requestOption";
import axios from "axios";

const backendURL = "http://18.136.195.171:8080";

export async function authentication(path, token) {
  try {
    let endpoint = backendURL;
    if (path != "") {
      endpoint = `${backendURL}/${path}`;
    }
    const option = requestOption(token);
    // console.log(option);
    const bodyParameters = { key: "value" };
    const res = await axios.post(endpoint, bodyParameters, option);
    return res;
  } catch (err) {
    return err.response;
  }
}

export async function callAPIGet(path, token, bodyParam) {
  try {
    let endpoint = backendURL;
    if (path != "") {
      endpoint = `${backendURL}/${path}`;
    }
    // console.log(endpoint);
    const option = requestOption(token);
    // console.log("option", option);
    // const bodyParameters = {key: 'value'};
    let res = null;
    if (bodyParam == null) {
      // console.log("bodyParam null");
      res = await axios.get(endpoint, option);
      // console.log("res", res);
    } else {
      // console.log("bodyParam", bodyParam);
      res = await axios.get(endpoint, bodyParam, option);
    }
    return res;
  } catch (err) {
    return err.response;
  }
}

export async function callAPIPost(path, token, bodyParam) {
  try {
    let endpoint = backendURL;
    if (path != "") {
      endpoint = `${backendURL}/${path}`;
    }
    // console.log(endpoint);
    const option = requestOption(token);
    // console.log("option", option);
    //   const bodyParameters = {id: idApartment};
    let res = null;
    if (bodyParam == null) {
      res = await axios.post(endpoint, option);
    } else {
      res = await axios.post(endpoint, bodyParam, option);
    }

    return res;
  } catch (err) {
    return err.response;
  }
}

export async function callAPIPut(path, token, bodyParam) {
  try {
    let endpoint = backendURL;
    if (path != "") {
      endpoint = `${backendURL}/${path}`;
    }
    // console.log(endpoint);
    const option = requestOption(token);
    // console.log("option", option);
    //   const bodyParameters = {id: idApartment};
    let res = null;
    if (bodyParam == null) {
      await axios.put(endpoint, option);
    } else {
      // console.log("bodyParam", bodyParam);
      res = await axios.put(endpoint, bodyParam, option);
    }
    
    return res;
  } catch (err) {
    return err.response;
  }
}
