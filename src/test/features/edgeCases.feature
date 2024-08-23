Feature: Betting edge cases

  Background:
    Given I am logged in to Betfair

  Scenario: Entering a stake that exceeds the account balance
    When I place a bet on "Donald Trump" with odds "2" and a stake of "123456789"
    Then an error message should be displayed indicating insufficient funds

  Scenario: Entering only odds
    When I enter only odds without entering a stake amount
    Then the "Place bets" button should not be enabled

  Scenario: Entering only a stake amount
    When I enter only a stake amount without entering any odds
    Then the "Place bets" button should not be enabled

  Scenario: Entering a non-numeric value in the odds field
    When I place a bet on "Donald Trump" with odds "2" and stake "Ten"
    Then the system should not allow entering non-numeric values

  Scenario: Entering the minimum allowed odds
    When I place a bet on "Donald Trump" with odds "1" and a stake of "10"
    Then it should display "The minimum odds are 1.01 Your odds have been updated accordingly."
