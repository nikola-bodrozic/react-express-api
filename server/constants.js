const pd1 = {
    labels: ["Customer", "Business"],
    datasets: [
        {
            data: [12, 29],
            backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
            borderWidth: 1,
        },
    ],
};

const pd2 = {
    labels: ["Transport", "Packaging"],
    datasets: [
        {
            data: [45, 29],
            backgroundColor: ["#4BC0C0", "#9966FF"],
            borderWidth: 1,
        },
    ],
};

module.exports = { pd1, pd2 }