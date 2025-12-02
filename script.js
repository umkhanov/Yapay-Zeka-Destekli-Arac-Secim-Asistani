async function sendQuery() {
  const q = document.getElementById("query").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "Yükleniyor...";

  const response = await fetch("https://RENDER_URL/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q })
  });

  const data = await response.json();
  resultDiv.innerHTML =
    "<h3>Sonuçlar:</h3>" + "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}
