import { Dropbox, DropboxResponseError } from "dropbox";
import { Error as DropboxError, files } from "dropbox/types/dropbox_types";
import { authorize } from "./auth";
import { getPreferenceValues } from "@raycast/api";

async function getDropboxClient(): Promise<Dropbox> {
  const { dropbox_access_token } = getPreferenceValues<Preferences>();
  if (dropbox_access_token) return new Dropbox({ accessToken: dropbox_access_token });

  const tokenSet = await authorize();
  if (!tokenSet) {
    throw new Error("no dropbox token");
  }
  return new Dropbox({ accessToken: tokenSet.accessToken });
}

export interface ListFileResp {
  entries: Array<files.FileMetadataReference | files.FolderMetadataReference>;
  cursor: string;
  has_more: boolean;
}

export async function dbxListAnyFiles(req: { path: string; query: string; cursor: string }): Promise<ListFileResp> {
  try {
    if (req.cursor) {
      if (req.query) {
        return await dbxSearchFilesContinue(req.cursor);
      }
      return await dbxListFilesContinue(req.cursor);
    } else {
      if (req.query) {
        return await dbxSearchFiles(req.query);
      }
      return await dbxListFiles(req.path);
    }
  } catch (e) {
    throw new Error(convertError(e));
  }
}

export async function dbxListFiles(path: string): Promise<ListFileResp> {
  const dbx = await getDropboxClient();
  const resp = await dbx.filesListFolder({
    path: path,
    include_deleted: false,
  });
  return {
    entries: resp.result.entries as Array<files.FileMetadataReference | files.FolderMetadataReference>,
    cursor: resp.result.cursor,
    has_more: resp.result.has_more,
  };
}

export async function dbxListFilesContinue(cursor: string): Promise<ListFileResp> {
  const dbx = await getDropboxClient();
  const resp = await dbx.filesListFolderContinue({
    cursor: cursor,
  });
  return {
    entries: resp.result.entries as Array<files.FileMetadataReference | files.FolderMetadataReference>,
    cursor: resp.result.cursor,
    has_more: resp.result.has_more,
  };
}

export async function dbxSearchFiles(query: string): Promise<ListFileResp> {
  const dbx = await getDropboxClient();
  const resp = await dbx.filesSearchV2({
    query: query,
    include_highlights: false,
  });
  return convertSearchResult(resp.result);
}

export async function dbxSearchFilesContinue(cursor: string): Promise<ListFileResp> {
  const dbx = await getDropboxClient();
  const resp = await dbx.filesSearchContinueV2({
    cursor: cursor,
  });
  return convertSearchResult(resp.result);
}

function convertSearchResult(res: files.SearchV2Result): ListFileResp {
  const entries = res.matches
    .filter((v) => {
      return v.metadata[".tag"] === "metadata";
    })
    .map((v) => {
      const md = v.metadata as files.MetadataV2Metadata;
      return md.metadata;
    });
  return {
    entries: entries as Array<files.FileMetadataReference | files.FolderMetadataReference>,
    cursor: res.cursor || "",
    has_more: res.has_more,
  };
}

export function getFilePreviewURL(path: string): string {
  return `https://www.dropbox.com/preview${path}`;
}

function convertError(err: unknown): string {
  const e = err as DropboxResponseError<DropboxError<{ ".tag"?: string }>> | Error;
  if ("error" in e) {
    if (e.error.error[".tag"]) return e.error.error[".tag"];
  }
  if (e instanceof Error) return e.message;
  return `${e}`;
}
