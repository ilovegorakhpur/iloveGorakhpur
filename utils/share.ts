
interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Shares content using the Web Share API if available, otherwise copies to clipboard.
 * @param data The content to share.
 * @returns A promise that resolves to a status message string.
 */
export const shareContent = async (data: ShareData): Promise<string> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      // The promise resolves without a value if successful, 
      // so we don't return a message here as the share sheet itself provides feedback.
      // It rejects if the user cancels, so we catch that.
      return ''; 
    } catch (err) {
      // User cancelled the share sheet, do nothing.
      if (err instanceof Error && err.name === 'AbortError') {
        return '';
      }
      console.error('Error using Web Share API:', err);
      return 'Could not share content.';
    }
  } else {
    const fallbackText = `${data.title}\n\n${data.text}\n\nFind out more: ${data.url}`;
    try {
      await navigator.clipboard.writeText(fallbackText);
      return 'Copied to clipboard!';
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return 'Failed to copy content.';
    }
  }
};
