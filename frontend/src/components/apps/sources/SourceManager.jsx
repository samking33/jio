import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/api";
import "./SourceManager.css";

function mapSourceToUi(row = {}) {
  return {
    id: row.source_id,
    url: row.url || "",
    label: row.source_name || row.url || "Unnamed Source",
    active: row.active_flag !== false,
  };
}

export default function SourceManager() {
  const [sources, setSources] = useState([]);
  const [newUrl,  setNewUrl]  = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const loadSources = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await api.getSources();
    if (err) {
      setError(err);
    } else {
      setSources((Array.isArray(data) ? data : []).map(mapSourceToUi));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSources();
  }, []);

  const addSource = async () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl || saving) return;

    setSaving(true);
    setError(null);

    const { error: err } = await api.createSource({
      source_name:     newLabel.trim() || trimmedUrl,
      url:             trimmedUrl,
      category:        null,
      crawl_frequency: null,
    });

    if (err) {
      setError(err);
    } else {
      setNewUrl("");
      setNewLabel("");
      await loadSources();
    }
    setSaving(false);
  };

  const toggle = async (id) => {
    const source = sources.find((s) => s.id === id);
    if (!source) return;

    const newFlag = !source.active;
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, active: newFlag } : s)));

    const { error: err } = await api.updateSource(id, { active_flag: newFlag });
    if (err) {
      setSources((prev) => prev.map((s) => (s.id === id ? { ...s, active: !newFlag } : s)));
      setError(err);
    }
  };

  const remove = async (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));

    const { error: err } = await api.deleteSource(id);
    if (err) {
      setError(err);
      await loadSources();
    }
  };

  const visibleSources = useMemo(() => sources, [sources]);

  return (
    <div className="source-mgr">
      <div className="source-mgr__header">
        <span>🔗</span>
        <div>
          <div className="source-mgr__title">Source Manager</div>
          <div className="source-mgr__sub">Manage RFP ingestion URLs</div>
        </div>
      </div>

      <div className="source-mgr__body">
        <div className="source-mgr__add-form">
          <div className="source-mgr__form-title">Add New Source</div>
          <input
            className="source-mgr__input"
            placeholder="Source URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <input
            className="source-mgr__input"
            placeholder="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button
            className="source-mgr__add-btn"
            onClick={addSource}
            disabled={saving || !newUrl.trim()}
          >
            {saving ? "Adding..." : "+ Add Source"}
          </button>
        </div>

        {error && <div className="source-mgr__feedback source-mgr__feedback--error">{error}</div>}
        {loading && <div className="source-mgr__feedback">Loading sources...</div>}

        <div className="source-mgr__list-label">Registered Sources ({visibleSources.length})</div>
        <div className="source-mgr__list">
          {!loading && visibleSources.length === 0 && (
            <div className="source-mgr__feedback">No sources found.</div>
          )}

          {visibleSources.map((s) => (
            <div key={s.id} className={`source-mgr__item ${!s.active ? "source-mgr__item--inactive" : ""}`}>
              <div className={`source-mgr__dot ${s.active ? "active" : ""}`} />
              <div className="source-mgr__item-body">
                <div className="source-mgr__item-label">{s.label}</div>
                <div className="source-mgr__item-url">{s.url}</div>
              </div>
              <div className="source-mgr__item-actions">
                <button onClick={() => toggle(s.id)} className="source-mgr__action-btn">
                  {s.active ? "Pause" : "Enable"}
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="source-mgr__action-btn source-mgr__action-btn--danger"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
