// frontend/src/components/VersionViewer.jsx

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Map from './Map';
import BoatList from './BoatList';

function VersionViewer({ backendURLPrefix, versionId, onBack }) {
  const [boatListings, setBoatListings] = useState([]);
  const [boatsOnMap, setBoatsOnMap] = useState([]);
  const [versionInfo, setVersionInfo] = useState(null);

  useEffect(() => {
    fetchVersionData();
  }, [versionId]);

  const fetchVersionData = async () => {
    const sessionCookie = Cookies.get('supabase-session');

    try {
      const response = await fetch(`${backendURLPrefix}/versions/${versionId}/data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBoatListings(data.boat_listings);
        setBoatsOnMap(data.boats_on_map);
      } else {
        console.error('Error fetching version data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="version-viewer">
      <div className="viewer-header">
        <h2>Viewing Historical Version (Read-Only)</h2>
        <button onClick={onBack}>Back to Revisions</button>
      </div>

      <div className="container">
        <div className="map-section">
          <Map
            backendURLPrefix={backendURLPrefix}
            boatsOnMap={boatsOnMap}
            setBoatsOnMap={() => {}} // No-op for read-only
            saveBoatOnMap={() => {}} // No-op for read-only
            activeBoatOnMapId={null}
            setActiveBoatOnMapId={() => {}} // No-op for read-only
            boatFindMode={false}
            highlightedBoatId={null}
            addNewBoatOnMap={() => {}} // No-op for read-only
            bringBoatToCenter={() => {}} // No-op for read-only
            readOnly={true}
          />
        </div>
        <div className="listing-section">
          <h2>Boat Listings (Read-Only)</h2>
          <BoatList
            boatListings={boatListings}
            onEdit={() => {}} // No-op for read-only
            onDelete={() => {}} // No-op for read-only
            boatsOnMap={boatsOnMap}
            setBoatsOnMap={() => {}} // No-op for read-only
            activeBoatOnMapId={null}
            assignBoatListingToMap={() => {}} // No-op for read-only
            onViewBoat={() => {}} // No-op for read-only
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}

export default VersionViewer;