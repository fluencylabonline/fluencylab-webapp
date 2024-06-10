import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

interface ChartProps {
    data: { data: string; pontos: string }[];
}

const NivelamentoChart: React.FC<ChartProps> = ({ data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map((item) => item.data),
                        datasets: [{
                            label: 'Pontos',
                            data: data.map((item) => parseFloat(item.pontos)), // Convert pontos to numbers
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data'
                                },
                                type: 'time',
                                time: {
                                    unit: 'day' // Adjust time unit as needed
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Pontos'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
                return () => {
                    chart.destroy();
                };
            }
        }
    }, [data]);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default NivelamentoChart;
