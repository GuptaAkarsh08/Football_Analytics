# Docker

**Docker** - It is the open source platform for building, running and shipping applications inside containers. It basically puts everything from your environment into containers, and that container can be used by your coworker.

**Containers** - They are lightweight, portable and self-sufficient environments that package an application along with all its libraries, dependencies, and configurations. Their primary work is to ensure that an application runs across different machines without facing any issues of dependencies or libraries.

**Docker in SE** - It assists with deployment, scaling and management of your applications using containerization.

---

## 3 Main components of Docker

- **Dockerfile** - A text file which contains all the commands needed, in order, to build a given image. Think of it as the *recipe*.
- **Docker Image** - A lightweight, standalone executable package that includes everything to run your application — code, libraries, environment variables and config files. Think of it as a *frozen snapshot* built from the Dockerfile.
- **Docker Container** - The runtime instance of your Docker image — in other words, a container is the *running, live version* of your image. It is completely isolated from the host and other containers, has its own filesystem, and can be started, stopped and deleted independently. You can run the same image multiple times → multiple containers from one recipe.

**Flow: Dockerfile (recipe) → Image (frozen snapshot) → Container (live running instance)**

---

## What is a registry?

A **registry** is a storage and distribution system for Docker images — Docker Hub is the most common one (think GitHub, but for images instead of code).

- `docker push` → uploads your image to a registry so others can use it
- `docker pull` (or `docker run`, which auto-pulls if the image isn't local) → downloads an image from a registry

Example: `confluentinc/cp-kafka:7.5.0` in our `docker-compose.yml` is being pulled from Docker Hub's public registry.

---

## What is Docker Compose?

A tool for defining and running **multi-container applications** using a single YAML file (`docker-compose.yml`).

Instead of running separate `docker run` commands for Kafka, Zookeeper, and Postgres one at a time, we describe all three services in one file and start them together with `docker compose up`.

Compose also **automatically creates a shared network** so containers can talk to each other by container name. This is why, inside our compose file, Kafka can reach Zookeeper using `zookeeper:2181` instead of an IP address — Docker's internal DNS resolves the container name automatically.

---

## Docker Commands

### Compose commands

- **`docker compose up --build --detach`**
    - `docker compose up` - Reads the compose.yaml file
    - `--build` - Creates the frontend image and API for the project
    - `--detach` - Makes sure the docker services run in the background

- **`docker compose up -d`**
    - `docker compose up` - Reads contents of the yaml file
    - `up` - Responsible for starting the container(s) if not already created
    - `-d` - Runs the services in the background so they're not visible/blocking in the terminal

- **`docker compose ps`**
    - Shows info for the services running inside containers defined in **this specific** docker-compose.yml (e.g. postgresql, kafka, zookeeper)

- **`docker compose down --volumes`**
    - Stops and removes all containers from this compose stack
    - `--volumes` also deletes the associated volumes (i.e. your data gets wiped too — use carefully)

### Build & run commands

- **`docker build --tag <username>/<application_name> .`**
    - `build` - Used to create the image
    - `--tag` - Names the image with your username and application name, e.g. `guptaakarsh08/mva`
    - `<username>` - Your Docker Hub username, e.g. `guptaakarsh08`
    - `<application_name>` - Your application's name, e.g. `getting_started_todo_app`
    - The trailing `.` tells Docker to look for the Dockerfile in the current directory

- **`docker run --detach --name todo --publish 8080:3000 YOUR_DOCKER_USERNAME/getting-started-todo-app`**
    - `docker run` - "Create AND start a new container from an image" (different from `docker exec`, which runs a command *inside an already-running* container)
    - `--detach` - Runs in the background without blocking the terminal
    - `--name todo` - Names this container "todo" so you can reference it later (e.g. `docker stop todo`)
    - `--publish 8080:3000` - Connects your laptop's port 8080 to the container's internal port 3000 (`HOST_PORT:CONTAINER_PORT`)
    - `YOUR_DOCKER_USERNAME` - Your Docker Hub username, e.g. `guptaakarsh08`
    - `getting-started-todo-app` - The application/image name

- **`docker rm --force todo`**
    - Forcefully removes a container, even if it's currently running
    - Normally you'd need to `docker stop todo` first, then `docker rm todo` — `--force` does both in one step

---

## Building images — deeper concepts

### Understanding image layers

Every instruction in a Dockerfile (`FROM`, `RUN`, `COPY`, etc.) creates a new **layer** — a snapshot of filesystem changes. Layers stack on top of each other to form the final image.

```dockerfile
FROM python:3.11                      # layer 1 (base OS + Python)
COPY requirements.txt .               # layer 2 (adds this file)
RUN pip install -r requirements.txt   # layer 3 (installs packages)
COPY . .                              # layer 4 (adds your code)
```

Layers are **cached and reused**. If only your code changes (layer 4) but `requirements.txt` didn't change, Docker reuses layers 1-3 from cache and only rebuilds layer 4.

### Writing a Dockerfile

A basic Dockerfile for a Python script:

```dockerfile
FROM python:3.11-slim       # base image to start from
WORKDIR /app                 # set working directory inside container
COPY requirements.txt .      # copy dependency list first (for caching)
RUN pip install -r requirements.txt
COPY . .                     # copy the rest of your code
CMD ["python", "main.py"]    # command to run when container starts
```

We'll write one of these when we containerize our ingestion scripts (Phase 1) instead of running them directly with `python script.py` on the host machine.

### Using the build cache

Directly related to layers above. Docker caches each layer during `docker build`. If nothing changed in a layer's instructions or the files it copies, Docker skips rebuilding it and reuses the cached version — making builds much faster.

**Practical rule:** order your Dockerfile from *least frequently changing* to *most frequently changing*. That's why `COPY requirements.txt .` + `RUN pip install` happens **before** `COPY . .` in the example above — dependencies change rarely, code changes often. If reversed, every code change would invalidate the pip install cache too, forcing a full reinstall on every build.

### Multi-stage builds

A technique to keep final images small. Use one stage to *build* the app (with all the heavy compilers/tools) and a second, minimal stage to *run* it — discarding everything from the build stage except the final output.

```dockerfile
# Stage 1: build
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: run (much smaller final image)
FROM node:20-slim
COPY --from=builder /app/dist /app
CMD ["node", "/app/index.js"]
```

Not urgent for our data pipeline right now — more relevant when containerizing the React frontend (Shop Football) later.

---

## Running containers — deeper concepts

### Overriding container defaults

Every image has default behavior — a default command it runs, default environment variables, a default working directory. These can be overridden at `docker run` time without changing the image itself.

```bash
docker run postgres:16                                # runs Postgres with its defaults
docker run -e POSTGRES_PASSWORD=mypass postgres:16     # overrides an env var
docker run postgres:16 psql --version                  # overrides the default command entirely
```

This is exactly what our `docker-compose.yml` does under `environment:` — overriding the Postgres image's default credentials with `POSTGRES_USER: admin`.

### 1. Volumes

A **volume** is persistent storage that lives *outside* the container's lifecycle, managed by Docker. Without it, when a container is deleted, all its data disappears with it.

Example from our project:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```
Postgres data survives even after `docker compose down` — the volume keeps it safe until explicitly deleted (`docker compose down --volumes`).

**Confirmed via testing:** volumes are still required in current Docker versions to persist data across container deletion — this hasn't changed. A stopped-and-restarted *same* container will always keep its data regardless of volumes; the volume only matters once the container itself is deleted and recreated.

### 2. Sharing local files with containers (bind mounts)

A **bind mount** is different from a volume — it maps a folder on your *actual laptop* directly into the container, instead of Docker managing the storage internally.

```bash
docker run -v /Users/akarsh/myproject:/app python:3.11
```

Now `/app` inside the container IS `/Users/akarsh/myproject` on the laptop — live, two-way sync. Editing a file locally updates it inside the container instantly.

**Volume vs bind mount:**

| | Volume | Bind mount |
|---|---|---|
| Managed by | Docker | You (any folder on your laptop) |
| Used for | Persisting data (databases) | Live development (editing code, seeing changes instantly) |
| Example | `postgres_data:/var/lib/postgresql/data` | `./my-code:/app` |

Useful for Phase 2 — when writing Spark jobs, a bind mount lets us edit Python files locally and have Spark (running inside Docker) pick up changes immediately, without rebuilding the image every time.

### 3. `docker logs`

Shows what's happening *inside* a container — essential for debugging when something isn't working.

```bash
docker logs todo
docker logs -f todo    # -f = follow, streams logs live as they happen
```

### 4. `docker ps` vs `docker compose ps`

```bash
docker ps              # shows ALL running containers on this machine, from any project
docker compose ps      # shows only containers from THIS docker-compose.yml file
```

### 5. Networks

When running `docker compose up`, Docker automatically creates a private network so all services can talk to each other **by container name** (see "What is Docker Compose?" above).

Without Compose, containers can't see each other unless a network is manually created and attached (`docker network create`).

### 6. `docker exec`

Runs a command **inside an already-running** container — different from `docker run`, which creates a brand-new container from an image.

```bash
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
docker exec -it kafka bash    # opens an interactive shell INSIDE the running container
```

`-it` = `-i` (interactive, keep input open) + `-t` (give a proper terminal) — same flags used with `docker run` when needing to type into a container.

### 7. Image tags / versions

```yaml
image: confluentinc/cp-kafka:7.5.0
```

The `:7.5.0` part is a **tag** — a specific version of the image. If omitted, Docker defaults to `:latest`, which can silently break a setup when the image updates upstream and changes behavior.

**Best practice:** always pin a specific version (as our compose file already does) so the environment stays reproducible and predictable — a habit worth carrying across every tool, not just Docker.

---

## Share the image

Images can be shared through a **registry**. Docker Hub is a registry for storing images and making them available to other machines and deployment systems.

You can create a public repository and push an image to that repo so it can be used by other machines.

**Commands**

```bash
docker login
docker push <username>/<application_name>
```
