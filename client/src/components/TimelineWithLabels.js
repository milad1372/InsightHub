import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

function TimelineWithLabels({ timelineData }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (timelineData && timelineData.length) {
            const ctx = chartRef.current.getContext('2d');

            // Sort by timestamp
            timelineData.sort((a, b) => new Date(a.addTimeStamp) - new Date(b.addTimeStamp));
console.log("time:", timelineData)
            // Count the number of artworks for each query
            let counts = timelineData.reduce((p, c) => {
                let query = c.query.toLowerCase();
                if (!p.hasOwnProperty(query)) {
                    p[query] = { count: 0, date: c.addTimeStamp };
                }
                p[query].count++;
                return p;
            }, {});

            const labels = Object.keys(counts).map(k => new Date(counts[k].date));
            const data = Object.values(counts).map(item => item.count);
            const queries = Object.keys(counts);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '',
                        data: data,
                        fill: false,
                        borderColor: '#6c757d',
                        pointBackgroundColor: '#6c757d',
                        tension: 0.1
                    }]
                },
                options: {
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'MMM d, yyyy HH:MM:SS'
                            },
                            title: {
                                display: true,
                                text: 'Timestamp'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            precision: 0,
                            title: {
                                display: true,
                                text: 'Number of Artworks'
                            },
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    if (Math.floor(value) === value) {
                                        return value;
                                    }
                                }
                            },
                            max: Math.max(...data) + 1
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    let date = context[0].label;
                                    return `Date: ${date}`;
                                },
                                label: function(context) {
                                    let index = context.dataIndex;
                                    let value = context.parsed.y;
                                    let queryText = queries[index];
                                    return [`Query: ${queryText}`, `Artworks: ${value}`];
                                }
                            }
                        }
                    }
                }
            });
        }
    }, [timelineData]);

    return (
        <canvas className={"visualization-element-for-galley"} ref={chartRef}></canvas>
    );
}

export default TimelineWithLabels;
