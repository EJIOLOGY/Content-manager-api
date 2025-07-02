const express = require("express");
const app = express();
const PORT = 3001;

const path = require("path");
const pathToFile = path.resolve("./data.json");
const fs = require("fs");
const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => String(resource.id) === id);
  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex(
    (resource) => String(resource.id) === String(id)
  );
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (index === -1) {
    return res.status(404).send({ error: "Resource not found" });
  }

  resources[index] = {
    ...req.body,
    id: String(resources[index].id),
  };

  // If the resource is being activated, ensure no other resource is active and update the active resource
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activatedAt = new Date().toISOString();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(500).send("Internal Server Error");
    }
    res.send({ status: "success", resource: resources[index] });
  });
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const receivedData = req.body;

  resources.unshift({
    ...receivedData,
    id: String(Date.now()),
  });

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(500).send("Internal Server Error");
    }
    res.send({ status: "success", resource: resources[0] });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
