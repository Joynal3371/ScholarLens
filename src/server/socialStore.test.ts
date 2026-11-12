import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SocialNetworkStore,
  SocialForbiddenError,
  SocialValidationError,
} from './socialStore';

function createTestStore() {
  return new SocialNetworkStore({
    firestoreDocBase: '',
    getBridgeToken: async () => null,
    fallbackUsersProvider: () => [
      {
        uid: 'u_joynal',
        name: 'Joynal Abadin',
        scholarUserId: '3nI1dHsAAAAJ',
        orcidId: '0009-0007-9332-9241',
        verified: true,
      },
      {
        uid: 'u_aminul',
        name: 'Aminul Islam',
        scholarUserId: 'X6_inMYAAAAJ',
        orcidId: '0000-0002-8275-6631',
        verified: true,
      },
    ],
  });
}

test('LinkedIn-style connection workflow handles request, auto-mutual accept, decline, and removal', async () => {
  const store = createTestStore();

  await assert.rejects(
    () => store.sendConnectionRequest('u_joynal', 'u_joynal'),
    SocialValidationError
  );

  const req1 = await store.sendConnectionRequest('u_joynal', 'u_aminul', 'Great Data in Brief work!');
  assert.equal(req1.status, 'pending_sent');

  const overviewA = await store.getConnectionsOverview('u_aminul');
  assert.equal(overviewA.incomingRequests.length, 1);
  assert.equal(overviewA.statusByUid.u_joynal, 'pending_received');

  // If Aminul sends a connect request back before responding, it auto-connects
  const mutual = await store.sendConnectionRequest('u_aminul', 'u_joynal');
  assert.equal(mutual.status, 'connected');

  const overviewJ = await store.getConnectionsOverview('u_joynal');
  assert.deepEqual(overviewJ.acceptedUids, ['u_aminul']);
  assert.equal(overviewJ.statusByUid.u_aminul, 'connected');

  await store.removeConnection('u_joynal', 'u_aminul');
  const cleared = await store.getConnectionsOverview('u_joynal');
  assert.equal(cleared.acceptedUids.length, 0);
});

test('Direct messaging tracks unread counters per participant and resets when thread is opened', async () => {
  const store = createTestStore();

  await assert.rejects(
    () => store.sendMessage('u_joynal', 'u_aminul', '   '),
    SocialValidationError
  );

  await store.sendMessage('u_joynal', 'u_aminul', 'Hello Dr. Islam!');
  await store.sendMessage('u_joynal', 'u_aminul', 'Let us collaborate on a Landsat paper.');

  const threadsForAminul = await store.listConversationsForUser('u_aminul');
  assert.equal(threadsForAminul.length, 1);
  assert.equal(threadsForAminul[0].unreadBy.u_aminul, 2);

  const threadView = await store.getThreadWithUser('u_aminul', 'u_joynal');
  assert.equal(threadView.messages.length, 2);
  assert.equal(threadView.messages[1].text, 'Let us collaborate on a Landsat paper.');

  const afterRead = await store.listConversationsForUser('u_aminul');
  assert.equal(afterRead[0].unreadBy.u_aminul, 0);
});

test('Research posts support caption, mentioned paper, tagged co-authors, image/video, likes, comments, and owner delete', async () => {
  const store = createTestStore();

  const created = await store.createPost('u_joynal', {
    caption: 'Excited to share our 25-year Narayanganj Landsat dataset!',
    mentionedWork: {
      title: 'A 25-year Landsat-derived environmental observation dataset for Narayanganj, Bangladesh, 2001–2025',
      venue: 'Data in Brief',
      year: 2026,
      quartile: 'Q1',
      doi: '10.1016/j.dib.2026.113392',
    },
    taggedCoAuthors: [
      { name: 'Aminul Islam', scholarUserId: 'X6_inMYAAAAJ', uid: 'u_aminul' },
      { name: 'ASM Shihavuddin' },
    ],
    images: ['https://example.org/landsat-preview.jpg'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });

  assert.ok(created.id.startsWith('post_'));
  assert.equal(created.mentionedWork?.venue, 'Data in Brief');
  assert.equal(created.taggedCoAuthors.length, 2);
  assert.equal(created.video?.kind, 'external');

  const liked = await store.toggleLikePost('u_aminul', created.id);
  assert.deepEqual(liked.likes, ['u_aminul']);

  const commented = await store.addCommentToPost('u_aminul', created.id, 'Congratulations!');
  assert.equal(commented.comments.length, 1);

  await assert.rejects(
    () => store.deletePost('u_aminul', created.id),
    SocialForbiddenError
  );

  await store.deletePost('u_joynal', created.id);
  const posts = await store.listPosts();
  assert.equal(posts.length, 0);
});
