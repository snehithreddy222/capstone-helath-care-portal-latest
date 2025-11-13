// backend/utils/azureBlob.js
const {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_KEY;
const container = process.env.AZURE_STORAGE_CONTAINER || "health-docs";

if (!accountName || !accountKey) {
  console.warn("[azureBlob] Missing AZURE_STORAGE_ACCOUNT or AZURE_STORAGE_KEY");
}

const creds = new StorageSharedKeyCredential(accountName, accountKey);

/**
 * Build a SAS URL for a blob.
 * @param {string} key           blob path in container
 * @param {string} filename      suggested filename
 * @param {"attachment"|"inline"} disposition default "attachment"
 */
function sasUrl(key, filename = "file.pdf", disposition = "attachment") {
  const startsOn = new Date(Date.now() - 60 * 1000);
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const safeName = String(filename).replace(/[^\w.\-]+/g, "_");
  const cd = `${disposition}; filename="${safeName}"`;

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName: key,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
      // Force the browser behavior
      contentDisposition: cd,
      contentType: "application/pdf",
    },
    creds
  ).toString();

  const path = `${encodeURI(key)}`.replace(/^\/+/, "");
  return `https://${accountName}.blob.core.windows.net/${container}/${path}?${sas}`;
}

module.exports = { sasUrl };
