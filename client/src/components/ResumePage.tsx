import { useState } from 'react';
import { ResumeUpload } from './ResumeUpload';
import { ResumeList } from './ResumeList';

export function ResumePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger re-render of ResumeList by changing key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
        <ResumeUpload onSuccess={handleUploadSuccess} />
        <ResumeList key={refreshKey} />
    </div>
  );
}
