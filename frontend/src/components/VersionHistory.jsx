// frontend/src/components/VersionHistory.jsx

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import AreYouSure from './AreYouSure';

function VersionHistory({ backendURLPrefix, onClose, onViewVersion }) {
  const [versions, setVersions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchNote, setSearchNote] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchVersions = async (page = 1) => {
    const sessionCookie = Cookies.get('supabase-session');
    
    let url = `${backendURLPrefix}/versions?page=${page}`;
    if (searchStartDate) url += `&start_date=${searchStartDate}`;
    if (searchEndDate) url += `&end_date=${searchEndDate}`;
    if (searchNote) url += `&search_note=${searchNote}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
        setTotalPages(data.pages);
        setCurrentPage(page);
      } else {
        console.error('Error fetching versions');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleRestore = async (versionId) => {
    const sessionCookie = Cookies.get('supabase-session');

    try {
      const response = await fetch(`${backendURLPrefix}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        setShowConfirmation(null);
        window.location.reload(); // Reload to show restored version
      } else {
        console.error('Error restoring version');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const confirmRestore = (version) => {
    setShowConfirmation({
      message: `Are you sure you want to restore to version from ${new Date(version.created_at).toLocaleString()}?`,
      onYes: () => handleRestore(version.version_id),
      onNo: () => setShowConfirmation(null),
    });
  };

  const handleAddNote = (versionId, currentNote) => {
    setEditingNoteId(versionId);
    setNoteText(currentNote || '');
  };

  const saveNote = async (versionId) => {
    const sessionCookie = Cookies.get('supabase-session');

    try {
      const response = await fetch(`${backendURLPrefix}/versions/${versionId}/note`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ note: noteText })
      });

      if (response.ok) {
        setEditingNoteId(null);
        fetchVersions(currentPage);
      } else {
        console.error('Error saving note');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = () => {
    fetchVersions(1);
  };

  const handleClearSearch = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setSearchNote('');
    fetchVersions(1);
  };

  return (
    <div className="version-history-overlay">
      <div className="version-history-container">
        <div className="version-history-header">
          <h2>Version History</h2>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="search-filters">
          <div>
            <label>Start Date:</label>
            <input
              type="datetime-local"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="datetime-local"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
            />
          </div>
          <div>
            <label>Search Notes:</label>
            <input
              type="text"
              value={searchNote}
              onChange={(e) => setSearchNote(e.target.value)}
              placeholder="Search in notes..."
            />
          </div>
          <button onClick={handleSearch}>Search</button>
          <button onClick={handleClearSearch}>Clear</button>
        </div>

        <div className="versions-list">
          {versions.map((version) => (
            <div key={version.version_id} className="version-item">
              <div className="version-info">
                <strong>Version {new Date(version.created_at).toLocaleString()}</strong>
                {version.is_current && <span className="current-badge"> (Current)</span>}
                {editingNoteId === version.version_id ? (
                  <div className="note-editor">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      maxLength={200}
                      placeholder="Add a note (max 200 chars)"
                    />
                    <button onClick={() => saveNote(version.version_id)}>Save</button>
                    <button onClick={() => setEditingNoteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    {version.note && <div className="version-note">{version.note}</div>}
                  </>
                )}
              </div>
              <div className="version-actions">
                <button onClick={() => onViewVersion(version.version_id)}>View</button>
                {!version.is_current && (
                  <button onClick={() => confirmRestore(version)}>Renew this version</button>
                )}
                <button onClick={() => handleAddNote(version.version_id, version.note)}>
                  {version.note ? 'Edit note' : 'Add note'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button
            onClick={() => fetchVersions(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {'<'}
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => fetchVersions(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {'>'}
          </button>
        </div>
      </div>

      {showConfirmation && (
        <AreYouSure
          message={showConfirmation.message}
          onYes={showConfirmation.onYes}
          onNo={showConfirmation.onNo}
        />
      )}
    </div>
  );
}

export default VersionHistory;