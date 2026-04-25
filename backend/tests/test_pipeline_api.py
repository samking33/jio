import importlib
import sys

import pytest


@pytest.fixture
def client(monkeypatch):
  import db.connection

  monkeypatch.setattr(db.connection, "init_db", lambda: None)
  sys.modules.pop("app", None)
  app_module = importlib.import_module("app")
  app_module.app.config.update(TESTING=True)
  return app_module.app.test_client(), app_module


def test_latest_pipeline_run_not_found(client, monkeypatch):
  test_client, app_module = client
  monkeypatch.setattr(app_module, "get_latest_pipeline_run_state", lambda: None)

  response = test_client.get("/api/pipeline/runs/latest")

  assert response.status_code == 404
  assert response.get_json()["message"] == "No pipeline run found"


def test_create_pipeline_run_returns_state(client, monkeypatch):
  test_client, app_module = client
  monkeypatch.setattr(
    app_module,
    "create_new_pipeline_run",
    lambda: {
      "runId": 12,
      "status": "running",
      "currentStepId": 1,
      "steps": [],
      "pipelineData": {},
      "isRunning": False,
      "startedAt": "2026-04-25T00:00:00+00:00",
      "completedAt": None,
      "error": None,
    },
  )

  response = test_client.post("/api/pipeline/runs")

  assert response.status_code == 201
  assert response.get_json()["runId"] == 12


def test_execute_pipeline_step_returns_validation_error(client, monkeypatch):
  test_client, app_module = client

  def raise_validation(_run_id, _step_key, _body):
    raise ValueError("Step is not currently available for execution")

  monkeypatch.setattr(app_module, "execute_pipeline_step", raise_validation)

  response = test_client.post("/api/pipeline/runs/5/steps/filter", json={})

  assert response.status_code == 400
  assert response.get_json()["message"] == "Step is not currently available for execution"
