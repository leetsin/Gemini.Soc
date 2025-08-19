<!["status"] = "running"
    time.sleep(5) # Simulate computation time

    # Simulate a successful execution with a JSON output, mimicking Scilab's toJSON()
    # This structure is designed to be consumed by a frontend plotting library.[4]
    mock_plot_data = {
        "type": "plot",
        "data": [
            {"x": [1, 2, 3, 4], "y": [5, 6, 7, 8]},
        ],
        "layout": {
            "title": "My Scilab Plot",
            "xaxis": {"title": "X-Axis"},
            "yaxis": {"title": "Y-Axis"}
        }
    }
    
    job_store[job_id]["status"] = "completed"
    job_store[job_id]["output"] = json.dumps(mock_plot_data)
    print(f"Finished execution for job {job_id}.")


# --- API Endpoints ---
@app.post("/execute", response_model=JobResponse)
async def execute_code(request: ExecutionRequest, background_tasks: BackgroundTasks):
    """
    Receives Scilab code, creates a job, and dispatches it for execution.
    """
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"status": "queued", "output": None, "error": None}
    
    # Add the execution task to run in the background.
    # This simulates publishing a job to a message queue.
    background_tasks.add_task(simulate_scilab_execution, job_id, request.code)
    
    return JobResponse(job_id=job_id, status="queued")

@app.get("/job/{job_id}", response_model=JobResult)
async def get_job_status(job_id: str):
    """
    Retrieves the status and result of a specific job.
    """
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return JobResult(job_id=job_id, **job)

```

# requirements.txt (for Backend API)
fastapi
uvicorn[standard]
]]>