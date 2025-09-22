import {
	Chart as ChartJS,
	ArcElement,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins once (side-effect import in App)
ChartJS.register(
	ArcElement,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	Title,
	ChartDataLabels
);

// Global defaults (optional)
ChartJS.defaults.font.family = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif`;
ChartJS.defaults.plugins.legend.display = false; // we'll render our own for pies
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
