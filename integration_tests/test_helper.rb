require "minitest/autorun"
require "faraday"
require "json"
require "securerandom"

require_relative "support/api_helper"

class Minitest::Test
  include ApiHelper
end