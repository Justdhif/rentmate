import { AvatarHelper } from './avatar.helper';

describe('AvatarHelper', () => {
  it('should generate DiceBear avatar URL with correct format', () => {
    const url = AvatarHelper.generateDefaultAvatar('user_123');
    expect(url).toContain('https://api.dicebear.com/7.x/bottts/png?seed=user_123&backgroundColor=');
  });

  it('should generate consistent background colors for same seed', () => {
    const url1 = AvatarHelper.generateDefaultAvatar('user_test_abc');
    const url2 = AvatarHelper.generateDefaultAvatar('user_test_abc');
    expect(url1).toBe(url2);
  });
});
