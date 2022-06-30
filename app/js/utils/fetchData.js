const fetchData = async (url) => {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    "Access-Control-Allow-Origin": "*",
  });
  try {
    const response = await fetch(url, { headers });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Fetch error! Turn off adblockers :)");
    }
  } catch (error) {
    alert(error);
  }
};

export { fetchData };
