function startAnimation() {
    d3.select("#animation-container").select("svg").remove();

    const sourcePort = document.getElementById("source-port").value;
    const destinationPort = document.getElementById("destination-port").value;
    const message = document.getElementById("message").value; // Get the message from the input field

    
    const sendersIP = 0;

    const svg = d3.select("#animation-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const boxCoords = [
        { x: 50, y: 200, title: "Sender", subTitle: "Sender Side", content: "Data being sent" },
        { x: 300, y: 200, title: "UDP Header", subTitle: "UDP Header", content: `Source Port: Source Port is a 2 Byte long field used to identify the port number of the source.<br>Destination Port: It is a 2 Byte long field, used to identify the port of the destined packet.<br>Length: Length is the length of UDP including the header and the data. It is a 16-bits field.<br>Checksum: Checksum is 2 Bytes long field. It is the 16-bit one’s complement of the one’s complement sum of the UDP header, the pseudo-header of information from the IP header, and the data, padded with zero octets at the end (if necessary) to make a multiple of two octets.` },
        { x: 550, y: 200, title: "IP Header", subTitle: "IP Header", content: `Version: Version of the IP protocol (4 bits), which is 4 for IPv4<br>HLEN: IP header length (4 bits), which is the number of 32 bit words in the header. The minimum value for this field is 5 and the maximum is 15.<br>Type of service: Low Delay, High Throughput, Reliability (8 bits)<br>Total Length: Length of header + Data (16 bits), which has a minimum value 20 bytes and the maximum is 65,535 bytes.<br>Identification: Unique Packet Id for identifying the group of fragments of a single IP datagram (16 bits)<br>Flags: 3 flags of 1 bit each: reserved bit (must be zero), do not fragment flag, more fragments flag (same order)<br>Fragment Offset: Represents the number of Data Bytes ahead of the particular fragment in the particular Datagram. Specified in terms of number of 8 bytes, which has the maximum value of 65,528 bytes.<br>Time to live: Datagram’s lifetime (8 bits), It prevents the datagram to loop through the network by restricting the number of Hops taken by a Packet before delivering to the Destination.<br>Protocol: Name of the protocol (8 bits)<br>Header Checksum: 16 bits header checksum for checking errors in the datagram header<br>Source IP address: 32 bits IP address of the sender<br>Destination IP address: 32 bits IP address of the receiver<br>Option: Optional information such as source route, record route.` },
        { x: 800, y: 200, title: "Receiver", subTitle: "Receiver Side", content: "" }
    ];

    boxCoords.forEach((coords, index) => {
        setTimeout(() => {
            const group = svg.append("g").attr("class", "animated-group");

            const rect = group.append("rect")
                .attr("x", coords.x)
                .attr("y", coords.y)
                .attr("width", 200)
                .attr("height", 100)
                .style("fill", "#f0f0f0")
                .style("stroke", "#000")
                .style("stroke-width", 2)
                .on("mouseover", () => showDetail(coords.title, coords.subTitle, coords.content));

            group.append("text")
                .attr("x", coords.x + 100)
                .attr("y", coords.y + 40)
                .text(coords.title)
                .attr("class", "header");

            if (index < boxCoords.length - 1) {
                const nextCoords = boxCoords[index + 1];
                svg.append("line")
                    .attr("x1", coords.x + 200)
                    .attr("y1", coords.y + 50)
                    .attr("x2", nextCoords.x)
                    .attr("y2", nextCoords.y + 50)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            }

            /* if (coords.title === "Sender" && index === 0) {
                const dataPacket = group.append("rect")
                    .attr("x", coords.x + 100)
                    .attr("y", coords.y + 20)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("class", "data-packet");
            } */
        }, index * 1000); // Delay each box by 2 seconds (adjust as needed)
    });
}


function startQuiz() {
    // Show or hide the quiz container based on its current display state
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = quizContainer.style.display === 'none' ? 'block' : 'none';
}

// Function to show detail box near the hovered element and display data
function showDetail(title, subTitle, content) {
    const detailBox = document.getElementById("detail-box");
    detailBox.innerHTML = `<h3>${title}</h3><h4>${subTitle}</h4><p>${content}</p>`;

    // Display the detail box near the hovered element
    const boundingBox = event.target.getBoundingClientRect();
    const posX = boundingBox.left + window.pageXOffset + (boundingBox.width - detailBox.offsetWidth) / 2;
    const posY = boundingBox.top + window.pageYOffset - detailBox.offsetHeight - 10;
    detailBox.style.left = posX + "px";
    detailBox.style.top = posY + "px";

    detailBox.style.display = "block";
}

function showPopUp(message, isSuccess) {
    const popUp = document.createElement("div");
    popUp.className = isSuccess ? "pop-up success" : "pop-up failure";
    popUp.textContent = message;

    document.body.appendChild(popUp);

    // Automatically remove the pop-up after a few seconds
    setTimeout(() => {
        popUp.remove();
    }, 3000); // Adjust the timeout as needed
}

function checkAnswer(correctOption) {
    const selectedOption = document.querySelector('input[name="quiz-q1"]:checked');

    if (selectedOption && selectedOption.value === correctOption) {
        showPopUp("Correct Answer! Well done!", true);
    } else {
        showPopUp("Incorrect Answer. Try again!", false);
    }
}


// Attach event listeners to elements for hovering effect and data display
document.querySelectorAll(".header").forEach(element => {
    element.addEventListener("mouseover", () => {
        let title, subTitle, content;
        if (element.parentElement.classList.contains("sender-group")) {
            title = "Sender";
            subTitle = "Sender Side";
            content = "Data being sent";
        } else if (element.parentElement.classList.contains("udp-header-group")) {
            title = "UDP Header";
            subTitle = "UDP Header";
            const sourcePort = document.getElementById("source-port").value;
            const destinationPort = document.getElementById("destination-port").value;
            content = `Source Port: ${sourcePort}<br>Destination Port: ${destinationPort}<br>Checksum: ${Math.floor(Math.random() * 65535)}`;
        } else if (element.parentElement.classList.contains("ip-header-group")) {
            title = "IP Header";
            subTitle = "IP Header";
            content = `Version: 4<br>HLEN: 5<br>Type of service: Low Delay, High Throughput, Reliability<br>Total Length: 20 bytes<br>Identification: Unique Packet Id<br>Flags: Reserved bit (must be zero), do not fragment flag, more fragments flag<br>Fragment Offset: Number of Data Bytes ahead of the particular fragment<br>Time to live: Datagram’s lifetime<br>Protocol: Name of the protocol<br>Header Checksum: 16 bits header checksum<br>Source IP address: Sender's IP address<br>Destination IP address: Receiver's IP address<br>Option: Optional information such as source route, record route`;
        }
        showDetail(title, subTitle, content);
    });
    element.addEventListener("mouseleave", () => {
        const detailBox = document.getElementById("detail-box");
        detailBox.style.display = "none";
    });
});

