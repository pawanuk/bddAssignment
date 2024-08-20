Feature: Place bets on multiple candidates

  Scenario: Place bets on candidates with random data
    Given I am logged in to Betfair
    When I navigate to the Politics section
    And I place a bet on the following candidates:
      | candidate      |
      | Kamala Harris  |
      | Donald Trump   |
      | Nikki Haley    |
    And I log out from the application
