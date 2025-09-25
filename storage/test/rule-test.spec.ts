import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { uploadBytes } from "firebase/storage";
import { readFileSync } from "fs";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";

let testEnv: RulesTestEnvironment;

describe("Storage rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-project-1234",
      storage: {
        rules: readFileSync("storage/storage.rules", "utf8"),
        host: "127.0.0.1",
        port: 9199,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearStorage();
  });

  test("should deny updates to existing files if not owned", async () => {
    const storage = testEnv.authenticatedContext("pluto").storage();
    const asset = storage.ref("avatars/pippo/avatar.png");
    await assertFails(uploadBytes(asset, new Blob([])));
  });

  test("should allow updates to existing files if owned", async () => {
    const storage = testEnv.authenticatedContext("pippo").storage();
    const asset = storage.ref("avatars/pippo/avatar.png");
    await assertSucceeds(uploadBytes(asset, new Blob([])));
  });

  test("should not allow unauthenticated users to upload files", async () => {
    const unauthedStorage = testEnv.unauthenticatedContext().storage();
    const storageRef = unauthedStorage.ref("some/file.txt");
    await assertFails(uploadBytes(storageRef, new Blob(["hello world"])));
  });
});
