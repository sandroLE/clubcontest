import { ClubcontestPage } from './app.po';

describe('clubcontest App', function() {
  let page: ClubcontestPage;

  beforeEach(() => {
    page = new ClubcontestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
