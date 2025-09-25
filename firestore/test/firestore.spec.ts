import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setDoc, doc } from "firebase/firestore";
import { readFileSync } from "fs";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";

let testEnv: RulesTestEnvironment;

describe("Firestore rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-project-1234",
      firestore: {
        rules: readFileSync("firestore/firestore.rules", "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  test("everyone authenticated can read posts", async () => {
    const bob = testEnv.authenticatedContext("bob");
    await assertSucceeds(bob.firestore().collection("posts").get());
    const unauthed = testEnv.unauthenticatedContext();
    await assertFails(unauthed.firestore().collection("posts").get());
  });

  test("users can only create posts with their owner ID", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const bob = testEnv.authenticatedContext("bob");
    // Alice can create a post with ownerId "alice"
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "posts/post1"), {
        title: "Hello World",
        ownerId: "alice",
      }),
    );
    // Bob cannot create a post with ownerId "alice"
    await assertFails(
      setDoc(doc(bob.firestore(), "posts/post2"), {
        title: "Hello World",
        ownerId: "alice",
      }),
    );
  });

  test("users can only delete their own posts", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const bob = testEnv.authenticatedContext("bob");
    // Alice creates a post
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "posts/post1"), {
        title: "Hello World",
        ownerId: "alice",
      }),
    );
    // Bob cannot delete Alice's post
    await assertFails(
      bob.firestore().collection("posts").doc("post1").delete(),
    );
    // Alice can delete her post
    await assertSucceeds(
      alice.firestore().collection("posts").doc("post1").delete(),
    );
  });

  test("admin can always delete posts", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const admin = testEnv.authenticatedContext("admin", { admin: true });
    // Alice creates a post
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "posts/post1"), {
        title: "Hello World",
        ownerId: "alice",
      }),
    );
    // Admin can delete Alice's post
    await assertSucceeds(
      admin.firestore().collection("posts").doc("post1").delete(),
    );
  });


});
