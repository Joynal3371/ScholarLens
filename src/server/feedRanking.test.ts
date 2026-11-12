import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFeedNetworkSets,
  sortAndRankFeedItems,
  sliceEndlessFeed,
  RankableFeedItem,
} from './feedRanking';
import { ResearcherWorksDigest } from './socialStore';

test('sortAndRankFeedItems orders Connected > Co-Author > Co-Authors Co-Author > Community', () => {
  const digests: Record<string, ResearcherWorksDigest> = {
    viewer_id: {
      scholarUserId: 'viewer_id',
      name: 'Joynal Abadin',
      affiliation: 'Green University of Bangladesh',
      country: 'Bangladesh',
      totalCitations: 10,
      hIndex: 2,
      publicationCount: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      coAuthors: [
        { name: 'Aminul Islam', scholarUserId: 'aminul_id' },
      ],
      works: [
        {
          id: 'w_shared',
          title: 'TinyML IoT Paper',
          venue: 'IEEE Access',
          year: 2025,
          citations: 5,
          coAuthorNames: ['Aminul Islam'],
        },
      ],
    },
    aminul_id: {
      scholarUserId: 'aminul_id',
      name: 'Aminul Islam',
      affiliation: 'Green University of Bangladesh',
      country: 'Bangladesh',
      totalCitations: 500,
      hIndex: 12,
      publicationCount: 50,
      updatedAt: '2026-01-01T00:00:00.000Z',
      coAuthors: [
        { name: 'Joynal Abadin', scholarUserId: 'viewer_id' },
        { name: 'Second Degree Collaborator', scholarUserId: 'second_deg_id' },
      ],
      works: [
        {
          id: 'w_aminul',
          title: 'Aminul Direct Work',
          venue: 'IEEE Sensors',
          year: 2026,
          citations: 12,
          coAuthorNames: ['Second Degree Collaborator'],
        },
      ],
    },
    second_deg_id: {
      scholarUserId: 'second_deg_id',
      name: 'Second Degree Collaborator',
      affiliation: 'DTU',
      country: 'Denmark',
      totalCitations: 900,
      hIndex: 20,
      publicationCount: 80,
      updatedAt: '2026-01-01T00:00:00.000Z',
      works: [],
    },
  };

  const network = buildFeedNetworkSets({
    viewerUid: 'u_viewer',
    viewerName: 'Joynal Abadin',
    viewerScholarUserId: 'viewer_id',
    acceptedUids: ['u_connected'],
    registeredUsers: [
      { uid: 'u_viewer', name: 'Joynal Abadin', scholarUserId: 'viewer_id' },
      { uid: 'u_connected', name: 'Connected Peer', scholarUserId: 'conn_id' },
    ],
    digests,
  });

  const unsorted: RankableFeedItem[] = [
    {
      feedId: 'community_1',
      kind: 'work',
      createdAt: '2026-05-01T00:00:00.000Z',
      sortScore: 9999999999999,
      author: { uid: 'u_stranger', name: 'Unrelated Researcher', scholarUserId: 'stranger_id' },
    },
    {
      feedId: 'second_deg_with_coauthor_listed',
      kind: 'work',
      createdAt: '2026-04-05T00:00:00.000Z',
      sortScore: 8900000000000,
      author: { name: 'Second Degree Collaborator', scholarUserId: 'second_deg_id' },
      work: { coAuthorNames: ['Aminul Islam'] },
    },
    {
      feedId: 'second_deg_1',
      kind: 'work',
      createdAt: '2026-04-01T00:00:00.000Z',
      sortScore: 9000000000000,
      author: { name: 'Second Degree Collaborator', scholarUserId: 'second_deg_id' },
    },
    {
      feedId: 'wrong_case_sid_stranger',
      kind: 'work',
      createdAt: '2026-06-01T00:00:00.000Z',
      sortScore: 9800000000000,
      author: { name: 'Phyllis Robinson', scholarUserId: 'AMINUL_ID' },
    },
    {
      feedId: 'coauthor_1',
      kind: 'work',
      createdAt: '2026-03-01T00:00:00.000Z',
      sortScore: 8000000000000,
      author: { name: 'Aminul Islam', scholarUserId: 'aminul_id' },
    },
    {
      feedId: 'connected_1',
      kind: 'post',
      createdAt: '2026-02-01T00:00:00.000Z',
      sortScore: 7000000000000,
      author: { uid: 'u_connected', name: 'Connected Peer', scholarUserId: 'conn_id' },
    },
  ];

  const ranked = sortAndRankFeedItems(unsorted, network);
  assert.deepEqual(
    ranked.map((r) => r.feedId),
    [
      'connected_1',
      'coauthor_1',
      'second_deg_1',
      'second_deg_with_coauthor_listed',
      'community_1',
      'wrong_case_sid_stranger',
    ]
  );
  assert.equal(ranked[0].suggestionReason, 'connected');
  assert.equal(ranked[1].suggestionReason, 'coauthor');
  assert.equal(ranked[2].suggestionReason, 'coauthor_coauthor');
  assert.equal(ranked[3].suggestionReason, 'coauthor_coauthor');
  assert.equal(ranked[3].suggestionLabel, "Co-Author's Co-Author");
  assert.equal(ranked[4].suggestionReason, 'community');
  assert.equal(ranked[5].suggestionReason, 'community');
});

test('sliceEndlessFeed keeps streaming items past initial pool with unique feedIds', () => {
  const pool = [
    { feedId: 'a' },
    { feedId: 'b' },
    { feedId: 'c' },
  ];

  const page1 = sliceEndlessFeed(pool, 0, 2, true);
  assert.equal(page1.hasMore, true);
  assert.deepEqual(
    page1.items.map((x) => x.feedId),
    ['a', 'b']
  );

  const page2 = sliceEndlessFeed(pool, 2, 4, true);
  assert.equal(page2.hasMore, true);
  assert.equal(page2.items.length, 4);
  assert.equal(new Set(page2.items.map((x) => x.feedId)).size, 4);
});
