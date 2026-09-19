/** Trigger a browser download of a Blob. */
export const saveBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Open a Blob (e.g. a PDF) in a new tab. */
export const openBlob = (blob) => {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener')
}
