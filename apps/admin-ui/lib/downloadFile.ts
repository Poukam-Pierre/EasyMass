import api from "./api";

// The PDF endpoints require the admin's JWT, so a plain <a href> can't hit
// them directly — fetch as a blob through the authenticated client instead
// and trigger the save via a throwaway object URL.
export async function downloadFile(url: string, filename: string) {
    const response = await api.get(url, { responseType: 'blob' });
    const objectUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
}
