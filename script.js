// script.js

// --- KONFIGURASI BLYNK --- //
const token = "M-MsQC9qCxhnBiJiMTED8bCRYgAsetqO";
const apiUrlPH = `https://blynk.cloud/external/api/get?token=${token}&pin=V1`;
const apiUrlMoisture = `https://blynk.cloud/external/api/get?token=${token}&pin=V0`;

// --- RENDERING STRUKTUR HALAMAN --- //
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // Buat header
  const header = document.createElement("header");
  const logoContainer = document.createElement("div");
  logoContainer.className = "logo-container";
  
  // Ganti 'logo.png' dengan URL logo Anda (atau hapus tag <img> jika tidak diperlukan)
  const logoImg = document.createElement("img");
  logoImg.src = "Logoo.png";
  logoImg.alt = "Logo";

  const title = document.createElement("h1");
  title.textContent = "TaniHarjo";

  logoContainer.appendChild(logoImg);
  logoContainer.appendChild(title);
  header.appendChild(logoContainer);
  root.appendChild(header);

  // Buat main container
  const main = document.createElement("main");

  // Sensor container untuk menampilkan nilai pH dan kelembapan
  const sensorContainer = document.createElement("div");
  sensorContainer.className = "sensor-container";
  
  // Nilai pH
  const pHLabel = document.createElement("p");
  pHLabel.textContent = "pH:";
  const pHValue = document.createElement("div");
  pHValue.id = "phValue";
  pHValue.className = "circle";
  pHValue.textContent = "--";
  
  // Nilai kelembapan
  const moistureLabel = document.createElement("p");
  moistureLabel.textContent = "Kelembapan (%):";
  const moistureValue = document.createElement("div");
  moistureValue.id = "moistureValue";
  moistureValue.className = "circle";
  moistureValue.textContent = "--";
  
  sensorContainer.appendChild(pHLabel);
  sensorContainer.appendChild(pHValue);
  sensorContainer.appendChild(moistureLabel);
  sensorContainer.appendChild(moistureValue);

  // Chart container
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  const canvas = document.createElement("canvas");
  canvas.id = "sensorChart";
  chartContainer.appendChild(canvas);

  // Tambahkan sensor container dan chart container ke main
  main.appendChild(sensorContainer);
  main.appendChild(chartContainer);
  
  root.appendChild(main);

  // Inisialisasi grafik setelah DOM tersusun
  initChart();
  // Ambil data sensor segera setelah halaman termuat
  fetchSensorData();
  // Set interval untuk update data setiap 1 menit (60000 ms)
  setInterval(fetchSensorData, 60000);
});

// --- INISIALISASI CHART --- //
let sensorChart;
const chartData = {
  labels: [],
  datasets: [
    {
      label: 'pH',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      yAxisID: 'y1',
      fill: false,
      tension: 0.1,
    },
    {
      label: 'Kelembapan (%)',
      data: [],
      borderColor: 'rgba(192, 75, 75, 1)',
      yAxisID: 'y2',
      fill: false,
      tension: 0.1,
    }
  ]
};

function initChart() {
  const ctx = document.getElementById('sensorChart').getContext('2d');
  sensorChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm'
            }
          },
          title: {
            display: true,
            text: 'Waktu'
          }
        },
        y1: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'pH'
          },
          suggestedMin: 0,
          suggestedMax: 14,
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Kelembapan (%)'
          },
          grid: {
            drawOnChartArea: false,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        }
      }
    }
  });
}

// --- AMBIL DATA DARI BLYNK --- //
function fetchSensorData() {
  Promise.all([
    fetch(apiUrlPH).then(response => response.text()),
    fetch(apiUrlMoisture).then(response => response.text())
  ])
  .then(([phText, moistureText]) => {
    const phValueNum = parseFloat(phText);
    const moistureValueNum = parseFloat(moistureText);
    const now = new Date();

    // Perbarui nilai sensor pada halaman
    document.getElementById("phValue").textContent = isNaN(phValueNum) ? "--" : phValueNum.toFixed(2);
    document.getElementById("moistureValue").textContent = isNaN(moistureValueNum) ? "--" : moistureValueNum;

    // Tambahkan data ke grafik
    chartData.labels.push(now);
    chartData.datasets[0].data.push(phValueNum);
    chartData.datasets[1].data.push(moistureValueNum);

    sensorChart.update();
  })
  .catch(error => {
    console.error("Error fetching sensor data:", error);
  });
}
