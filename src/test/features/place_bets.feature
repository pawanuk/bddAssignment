@placeBets
Feature: Place bets on multiple candidates

  Scenario: Place bets on candidates with random data
    Given I am logged in to Betfair
    When I navigate to the Politics section
    And I place a bet on the following candidates:
      | candidate      |
      | Kamala Harris  |
      | Donald Trump   |
      | Nikki Haley    |
  @exceeds-balance
  Scenario: Entering a stake that exceeds the account balance
    When I place a bet on "Donald Trump" with odds "2" and a stake of "123456789"
    Then an error message should be displayed indicating insufficient funds

  @only-odds
  Scenario: Entering only odds
    When I enter only odds without entering a stake amount
    Then the "Place bets" button should not be enabled

  @only-stake
  Scenario: Entering only a stake amount
    When I enter only a stake amount without entering any odds
    Then the "Place bets" button should not be enabled

    Then I log out from the application
